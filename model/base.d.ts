import { Observable } from 'rxjs/Observable';
import { ManagerBase } from '../manager';
export declare abstract class ModelBase {
    /**
     * The server-assigned id of the model.
     */
    id: any;
    private __metadata;
    private __modelValues;
    /**
     * Get the value of the property `name`.
     * @param propNameOrRefName
     */
    get(propNameOrRefName: string): any;
    /**
     * Set the value of the property `name` and return the mutated model.
     *
     * @param propNameOrRefName
     * @param value
     */
    set(propNameOrRefName: string, value: any): this;
    /**
     * Check whether the property, given either by it's property name or it's reference property name,
     * has been resolved.
     * @param propNameOrRefName
     * @returns {any}
     */
    isResolved(propNameOrRefName: string): boolean;
    resolveProperty(manager: ManagerBase<any>, propNameOrRefName: string): Observable<this>;
}
