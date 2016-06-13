import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/reduce';


import {identityConverter} from 'caesium-core/converter';

import {ModelMetadata} from '../../../src/model/metadata';
import {RawResponse, RequestOptions} from '../../../src/manager/model_http';
import {RequestFactory} from "../../../src/manager/request/factory";
import {Search, SearchParameter} from '../../../src/manager/search';

import {MockModelHttp} from './model_http.mock';

import {parameterTests} from "./search/parameter.spec";
import {parameterMapTests} from "./search/parameter_map.spec";
import {searchResultTests} from "./search/result.spec";
import {searchResultPageTests} from "./search/result_page.spec";

export function searchTests() {
    describe('search_request', () => {
        parameterTests();
        parameterMapTests();
        searchResultPageTests();
        searchResultTests();

        testSearch();
    });

}

const MODEL_KIND = 'test::MyModel';
const SEARCH_ENDPOINT = 'search';
const SEARCH_PAGE_SIZE = 5;


function isSubstring(modelValue: string, paramValue: string) {
    return modelValue.includes(paramValue);
}

function _mkSearch(
    parameters: SearchParameter[],
    requestHandler: (options: RequestOptions) => RawResponse
): Search<any> {
    var modelHttp = new MockModelHttp(requestHandler);
    var requestFactory = new RequestFactory(modelHttp, {kind: MODEL_KIND} as ModelMetadata);
    return new Search<any>(requestFactory, parameters, identityConverter, SEARCH_PAGE_SIZE, 'p');
}

function _errHandler(options: RequestOptions): RawResponse {
    throw 'Request handler should not be called';
}


export function testSearch() {
    describe('Search', () => {
        it('should be possible to get/set/delete a parameter value', () => {
            var search = _mkSearch([{name: 'a', encoder: identityConverter}], _errHandler);
            expect(search.hasParamValue('a')).toBe(false, 'uninitialized parameter');
            expect(search.getParamValue('a')).toBeUndefined('no notSetValue');
            expect(search.getParamValue('a', 0)).toBe(0, 'should use notSetValue');

            search.setParamValue('a', 42);
            expect(search.hasParamValue('a')).toBe(true, 'value initialized');
            expect(search.getParamValue('a', 0)).toBe(42, 'parameter value set');

            search.deleteParamValue('a');
            expect(search.hasParamValue('a')).toBe(false, 'value deleted');
        });

        it('mutating parameters should update the result stack', () => {
            var search = _mkSearch([{
                name: 'a',
                encoder: identityConverter,
                matcher: isSubstring
            }], _errHandler);

            function getResultStackParams(search: Search<any>): string[] {
                return (search as any)._resultStack
                    .map((result: any) => result.parameters.toString())
                    .toArray();
            }

            search.setParamValue('a', 'abc');
            expect(getResultStackParams(search)).toEqual(['', 'a=abc'], 'set parameter');

            search.setParamValue('a', 'abc');
            expect(getResultStackParams(search)).toEqual(['', 'a=abc'], 'set parameter to same value');

            search.setParamValue('a', 'abcdef');
            expect(getResultStackParams(search)).toEqual(['', 'a=abc', 'a=abcdef'], 'set refined parameter');

            search.setParamValue('a', 'abcdf');
            expect(getResultStackParams(search)).toEqual(['', 'a=abc', 'a=abcdf'], 'does not refine last value');

            search.deleteParamValue('a');
            expect(getResultStackParams(search)).toEqual(['']);
        });

        it('should be possible to submit an empty search to the server', (done) => {
            function requestHandler(options: RequestOptions): RawResponse {
                expect(options.params['p']).toEqual('1', 'should add a pageId parameter to the search');
                return {
                    status: 200,
                    body: {page_id: 1, last_page: true, items: [{a: '30'}]}
                };
            }
            var search = _mkSearch([{name: 'a', encoder: identityConverter}], requestHandler);
            expect(search.hasParamValue('a')).toBe(false, 'No parameters set');
            expect(search.result.items.toArray()).toEqual([], 'no pages loaded');

            return search.result.loadNextPage().toPromise().then((result) => {
                expect(result.items.toArray()).toEqual([{a: '30'}]);
                done();
            });
        });


        it('should be possible to search a data source', (done) => {
            var search = _mkSearch([{
                name: 'name',
                encoder: identityConverter,
                matcher: (modelValue, paramValue) => modelValue.includes(paramValue)
            }], searchCountries);

            var loadEmptySearchPage = search.result.loadNextPage().toPromise().then((result) => {
                expect(result.items.toArray()).toEqual([
                    {name: 'Afghanistan', code: 'AF'},
                    {name: 'Åland Islands', code: 'AX'},
                    {name: 'Albania', code: 'AL'},
                    {name: 'Algeria', code: 'DZ'},
                    {name: 'American Samoa', code: 'AS'}
                ],
                'result should contain the first page of results');
                search.setParamValue('name', 'Po');
                return search.result.loadNextPage().toPromise();
            }).then((result) => {
                expect(result.items.toArray()).toEqual([
                    {name: 'French Polynesia', code: 'PF'},
                    {name: 'Poland', code: 'PL'},
                    {name: 'Portugal', code: 'PT'},
                ], 'Should load the countries containing \'Po\'');
                search.deleteParamValue('name');

                // Should still have the results from the original page.
                expect(search.result.items.toArray()).toEqual([
                    {name: 'Afghanistan', code: 'AF'},
                    {name: 'Åland Islands', code: 'AX'},
                    {name: 'Albania', code: 'AL'},
                    {name: 'Algeria', code: 'DZ'},
                    {name: 'American Samoa', code: 'AS'}
                ], 'Should still have the original results');

                search.setParamValue('name', 'an');
                expect(search.result.items.toArray()).toEqual([
                    {name: 'Afghanistan', code: 'AF'},
                    {name: 'Åland Islands', code: 'AX'},
                    {name: 'Albania', code: 'AL'},
                    {name: 'American Samoa', code: 'AS'}
                ], 'Should refine the original results');
                return search.result.loadNextPage().toPromise();
            }).then((result) => {
                expect(search.result.items.toArray()).toEqual([
                    {name: 'Afghanistan', code: 'AF'},
                    {name: 'Åland Islands', code: 'AX'},
                    {name: 'Albania', code: 'AL'},
                    {name: 'American Samoa', code: 'AS'},
                    {name: 'Antigua and Barbuda', code: 'AG' }
                ], 'should have only loaded the remaining page');

                search.setParamValue('name', 'ani');

                return search.result.loadNextPage().toPromise();
            }).then((result) => {
                expect(search.result.items.toArray()).toEqual([
                    {name: 'Afghanistan', code: 'AF'},
                    {name: 'Albania', code: 'AL'},
                    {name: 'Lithuania', code: 'LT'},
                    {name: 'Mauritania', code: 'MR'},
                    {name: 'Romania', code: 'RO'},
                ]);

                search.setParamValue('name', 'Isl');
                // Should still have the original result.
                expect(search.result.items.toArray()).toEqual([
                    {name: 'Åland Islands', code: 'AX'},
                ]);
            }).catch((err) => fail(err)).then((_) => done());
        });
    });
}

function searchCountries(options: RequestOptions): RawResponse {
    var name_param = options.params['name'] || '';
    var matches = COUNTRIES.filter((c) => c.name.includes(name_param));

    var pageId = Number.parseInt(options.params['p']);

    return {
        status: 200,
        body: {
            page_id: pageId,
            items: matches.slice((pageId - 1) * SEARCH_PAGE_SIZE, pageId * SEARCH_PAGE_SIZE),
            last_page: pageId * SEARCH_PAGE_SIZE >= matches.length
        }
    }
}

const COUNTRIES = [
    {name: 'Afghanistan', code: 'AF'},
    {name: 'Åland Islands', code: 'AX'},
    {name: 'Albania', code: 'AL'},
    {name: 'Algeria', code: 'DZ'},
    {name: 'American Samoa', code: 'AS'},
    {name: 'Andorra', code: 'AD'},
    {name: 'Angola', code: 'AO'},
    {name: 'Anguilla', code: 'AI'},
    {name: 'Antarctica', code: 'AQ'},
    {name: 'Antigua and Barbuda', code: 'AG'},
    {name: 'Argentina', code: 'AR'},
    {name: 'Armenia', code: 'AM'},
    {name: 'Aruba', code: 'AW'},
    {name: 'Australia', code: 'AU'},
    {name: 'Austria', code: 'AT'},
    {name: 'Azerbaijan', code: 'AZ'},
    {name: 'Bahamas', code: 'BS'},
    {name: 'Bahrain', code: 'BH'},
    {name: 'Bangladesh', code: 'BD'},
    {name: 'Barbados', code: 'BB'},
    {name: 'Belarus', code: 'BY'},
    {name: 'Belgium', code: 'BE'},
    {name: 'Belize', code: 'BZ'},
    {name: 'Benin', code: 'BJ'},
    {name: 'Bermuda', code: 'BM'},
    {name: 'Bhutan', code: 'BT'},
    {name: 'Bolivia', code: 'BO'},
    {name: 'Bosnia and Herzegovina', code: 'BA'},
    {name: 'Botswana', code: 'BW'},
    {name: 'Bouvet Island', code: 'BV'},
    {name: 'Brazil', code: 'BR'},
    {name: 'British Indian Ocean Territory', code: 'IO'},
    {name: 'Brunei Darussalam', code: 'BN'},
    {name: 'Bulgaria', code: 'BG'},
    {name: 'Burkina Faso', code: 'BF'},
    {name: 'Burundi', code: 'BI'},
    {name: 'Cambodia', code: 'KH'},
    {name: 'Cameroon', code: 'CM'},
    {name: 'Canada', code: 'CA'},
    {name: 'Cape Verde', code: 'CV'},
    {name: 'Cayman Islands', code: 'KY'},
    {name: 'Central African Republic', code: 'CF'},
    {name: 'Chad', code: 'TD'},
    {name: 'Chile', code: 'CL'},
    {name: 'China', code: 'CN'},
    {name: 'Christmas Island', code: 'CX'},
    {name: 'Cocos (Keeling) Islands', code: 'CC'},
    {name: 'Colombia', code: 'CO'},
    {name: 'Comoros', code: 'KM'},
    {name: 'Congo', code: 'CG'},
    {name: 'Congo, The Democratic Republic of the', code: 'CD'},
    {name: 'Cook Islands', code: 'CK'},
    {name: 'Costa Rica', code: 'CR'},
    {name: 'Cote D\'Ivoire', code: 'CI'},
    {name: 'Croatia', code: 'HR'},
    {name: 'Cuba', code: 'CU'},
    {name: 'Cyprus', code: 'CY'},
    {name: 'Czech Republic', code: 'CZ'},
    {name: 'Denmark', code: 'DK'},
    {name: 'Djibouti', code: 'DJ'},
    {name: 'Dominica', code: 'DM'},
    {name: 'Dominican Republic', code: 'DO'},
    {name: 'Ecuador', code: 'EC'},
    {name: 'Egypt', code: 'EG'},
    {name: 'El Salvador', code: 'SV'},
    {name: 'Equatorial Guinea', code: 'GQ'},
    {name: 'Eritrea', code: 'ER'},
    {name: 'Estonia', code: 'EE'},
    {name: 'Ethiopia', code: 'ET'},
    {name: 'Falkland Islands (Malvinas)', code: 'FK'},
    {name: 'Faroe Islands', code: 'FO'},
    {name: 'Fiji', code: 'FJ'},
    {name: 'Finland', code: 'FI'},
    {name: 'France', code: 'FR'},
    {name: 'French Guiana', code: 'GF'},
    {name: 'French Polynesia', code: 'PF'},
    {name: 'French Southern Territories', code: 'TF'},
    {name: 'Gabon', code: 'GA'},
    {name: 'Gambia', code: 'GM'},
    {name: 'Georgia', code: 'GE'},
    {name: 'Germany', code: 'DE'},
    {name: 'Ghana', code: 'GH'},
    {name: 'Gibraltar', code: 'GI'},
    {name: 'Greece', code: 'GR'},
    {name: 'Greenland', code: 'GL'},
    {name: 'Grenada', code: 'GD'},
    {name: 'Guadeloupe', code: 'GP'},
    {name: 'Guam', code: 'GU'},
    {name: 'Guatemala', code: 'GT'},
    {name: 'Guernsey', code: 'GG'},
    {name: 'Guinea', code: 'GN'},
    {name: 'Guinea-Bissau', code: 'GW'},
    {name: 'Guyana', code: 'GY'},
    {name: 'Haiti', code: 'HT'},
    {name: 'Heard Island and Mcdonald Islands', code: 'HM'},
    {name: 'Holy See (Vatican City State)', code: 'VA'},
    {name: 'Honduras', code: 'HN'},
    {name: 'Hong Kong', code: 'HK'},
    {name: 'Hungary', code: 'HU'},
    {name: 'Iceland', code: 'IS'},
    {name: 'India', code: 'IN'},
    {name: 'Indonesia', code: 'ID'},
    {name: 'Iran, Islamic Republic Of', code: 'IR'},
    {name: 'Iraq', code: 'IQ'},
    {name: 'Ireland', code: 'IE'},
    {name: 'Isle of Man', code: 'IM'},
    {name: 'Israel', code: 'IL'},
    {name: 'Italy', code: 'IT'},
    {name: 'Jamaica', code: 'JM'},
    {name: 'Japan', code: 'JP'},
    {name: 'Jersey', code: 'JE'},
    {name: 'Jordan', code: 'JO'},
    {name: 'Kazakhstan', code: 'KZ'},
    {name: 'Kenya', code: 'KE'},
    {name: 'Kiribati', code: 'KI'},
    {name: 'Korea, Democratic People\'S Republic of', code: 'KP'},
    {name: 'Korea, Republic of', code: 'KR'},
    {name: 'Kuwait', code: 'KW'},
    {name: 'Kyrgyzstan', code: 'KG'},
    {name: 'Lao People\'S Democratic Republic', code: 'LA'},
    {name: 'Latvia', code: 'LV'},
    {name: 'Lebanon', code: 'LB'},
    {name: 'Lesotho', code: 'LS'},
    {name: 'Liberia', code: 'LR'},
    {name: 'Libyan Arab Jamahiriya', code: 'LY'},
    {name: 'Liechtenstein', code: 'LI'},
    {name: 'Lithuania', code: 'LT'},
    {name: 'Luxembourg', code: 'LU'},
    {name: 'Macao', code: 'MO'},
    {name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK'},
    {name: 'Madagascar', code: 'MG'},
    {name: 'Malawi', code: 'MW'},
    {name: 'Malaysia', code: 'MY'},
    {name: 'Maldives', code: 'MV'},
    {name: 'Mali', code: 'ML'},
    {name: 'Malta', code: 'MT'},
    {name: 'Marshall Islands', code: 'MH'},
    {name: 'Martinique', code: 'MQ'},
    {name: 'Mauritania', code: 'MR'},
    {name: 'Mauritius', code: 'MU'},
    {name: 'Mayotte', code: 'YT'},
    {name: 'Mexico', code: 'MX'},
    {name: 'Micronesia, Federated States of', code: 'FM'},
    {name: 'Moldova, Republic of', code: 'MD'},
    {name: 'Monaco', code: 'MC'},
    {name: 'Mongolia', code: 'MN'},
    {name: 'Montserrat', code: 'MS'},
    {name: 'Morocco', code: 'MA'},
    {name: 'Mozambique', code: 'MZ'},
    {name: 'Myanmar', code: 'MM'},
    {name: 'Namibia', code: 'NA'},
    {name: 'Nauru', code: 'NR'},
    {name: 'Nepal', code: 'NP'},
    {name: 'Netherlands', code: 'NL'},
    {name: 'Netherlands Antilles', code: 'AN'},
    {name: 'New Caledonia', code: 'NC'},
    {name: 'New Zealand', code: 'NZ'},
    {name: 'Nicaragua', code: 'NI'},
    {name: 'Niger', code: 'NE'},
    {name: 'Nigeria', code: 'NG'},
    {name: 'Niue', code: 'NU'},
    {name: 'Norfolk Island', code: 'NF'},
    {name: 'Northern Mariana Islands', code: 'MP'},
    {name: 'Norway', code: 'NO'},
    {name: 'Oman', code: 'OM'},
    {name: 'Pakistan', code: 'PK'},
    {name: 'Palau', code: 'PW'},
    {name: 'Palestinian Territory, Occupied', code: 'PS'},
    {name: 'Panama', code: 'PA'},
    {name: 'Papua New Guinea', code: 'PG'},
    {name: 'Paraguay', code: 'PY'},
    {name: 'Peru', code: 'PE'},
    {name: 'Philippines', code: 'PH'},
    {name: 'Pitcairn', code: 'PN'},
    {name: 'Poland', code: 'PL'},
    {name: 'Portugal', code: 'PT'},
    {name: 'Puerto Rico', code: 'PR'},
    {name: 'Qatar', code: 'QA'},
    {name: 'Reunion', code: 'RE'},
    {name: 'Romania', code: 'RO'},
    {name: 'Russian Federation', code: 'RU'},
    {name: 'RWANDA', code: 'RW'},
    {name: 'Saint Helena', code: 'SH'},
    {name: 'Saint Kitts and Nevis', code: 'KN'},
    {name: 'Saint Lucia', code: 'LC'},
    {name: 'Saint Pierre and Miquelon', code: 'PM'},
    {name: 'Saint Vincent and the Grenadines', code: 'VC'},
    {name: 'Samoa', code: 'WS'},
    {name: 'San Marino', code: 'SM'},
    {name: 'Sao Tome and Principe', code: 'ST'},
    {name: 'Saudi Arabia', code: 'SA'},
    {name: 'Senegal', code: 'SN'},
    {name: 'Serbia and Montenegro', code: 'CS'},
    {name: 'Seychelles', code: 'SC'},
    {name: 'Sierra Leone', code: 'SL'},
    {name: 'Singapore', code: 'SG'},
    {name: 'Slovakia', code: 'SK'},
    {name: 'Slovenia', code: 'SI'},
    {name: 'Solomon Islands', code: 'SB'},
    {name: 'Somalia', code: 'SO'},
    {name: 'South Africa', code: 'ZA'},
    {name: 'South Georgia and the South Sandwich Islands', code: 'GS'},
    {name: 'Spain', code: 'ES'},
    {name: 'Sri Lanka', code: 'LK'},
    {name: 'Sudan', code: 'SD'},
    {name: 'Suriname', code: 'SR'},
    {name: 'Svalbard and Jan Mayen', code: 'SJ'},
    {name: 'Swaziland', code: 'SZ'},
    {name: 'Sweden', code: 'SE'},
    {name: 'Switzerland', code: 'CH'},
    {name: 'Syrian Arab Republic', code: 'SY'},
    {name: 'Taiwan, Province of China', code: 'TW'},
    {name: 'Tajikistan', code: 'TJ'},
    {name: 'Tanzania, United Republic of', code: 'TZ'},
    {name: 'Thailand', code: 'TH'},
    {name: 'Timor-Leste', code: 'TL'},
    {name: 'Togo', code: 'TG'},
    {name: 'Tokelau', code: 'TK'},
    {name: 'Tonga', code: 'TO'},
    {name: 'Trinidad and Tobago', code: 'TT'},
    {name: 'Tunisia', code: 'TN'},
    {name: 'Turkey', code: 'TR'},
    {name: 'Turkmenistan', code: 'TM'},
    {name: 'Turks and Caicos Islands', code: 'TC'},
    {name: 'Tuvalu', code: 'TV'},
    {name: 'Uganda', code: 'UG'},
    {name: 'Ukraine', code: 'UA'},
    {name: 'United Arab Emirates', code: 'AE'},
    {name: 'United Kingdom', code: 'GB'},
    {name: 'United States', code: 'US'},
    {name: 'United States Minor Outlying Islands', code: 'UM'},
    {name: 'Uruguay', code: 'UY'},
    {name: 'Uzbekistan', code: 'UZ'},
    {name: 'Vanuatu', code: 'VU'},
    {name: 'Venezuela', code: 'VE'},
    {name: 'Viet Nam', code: 'VN'},
    {name: 'Virgin Islands, British', code: 'VG'},
    {name: 'Virgin Islands, U.S.', code: 'VI'},
    {name: 'Wallis and Futuna', code: 'WF'},
    {name: 'Western Sahara', code: 'EH'},
    {name: 'Yemen', code: 'YE'},
    {name: 'Zambia', code: 'ZM'},
    {name: 'Zimbabwe', code: 'ZW'}
];
