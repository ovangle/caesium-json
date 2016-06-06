import {decoratorsTests} from "./model/decorators.spec";
import {metadataTests} from "./model/metadata.spec";
import {modelBaseTests} from "./model/base.spec";
import {modelFactoryTests} from "./model/factory.spec";
import {reflectionTests} from "./model/reflection.spec";

export function modelTests() {
    describe('model', () => {
        modelBaseTests();
        decoratorsTests();
        modelFactoryTests();
        metadataTests();
        reflectionTests();

    })
}
