import {decoratorsTests} from "./model/decorators.spec";
import {managerTests} from "./model/manager.spec";
import {metadataTests} from "./model/metadata.spec";
import {modelBaseTests} from "./model/base.spec";
import {modelFactoryTests} from "./model/factory.spec";
import {reflectionTests} from "./model/reflection.spec";

export function modelTests() {
    describe('model', () => {
        modelBaseTests();
        decoratorsTests();
        modelFactoryTests();
        managerTests();
        metadataTests();
        reflectionTests();

    })
}
