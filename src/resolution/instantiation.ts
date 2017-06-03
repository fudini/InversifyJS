import { interfaces } from "../interfaces/interfaces";
import { TargetTypeEnum } from "../constants/literal_types";

function _injectProperties(
    instance: any,
    childRequests: interfaces.Request[],
    resolveRequest: (request: interfaces.Request) => any
): any {

    let propertyInjectionsRequests = childRequests.filter((childRequest: interfaces.Request) => {
        return (childRequest.target !== null && childRequest.target.type === TargetTypeEnum.ClassProperty);
    });

    let propertyInjections = propertyInjectionsRequests.map((childRequest: interfaces.Request) => {
        return resolveRequest(childRequest);
    });

    propertyInjectionsRequests.forEach((r: interfaces.Request, index: number) => {
        let propertyName = "";
        propertyName = r.target.name.value();
        let injection = propertyInjections[index];
        instance[propertyName] = injection;
    });

    return instance;

}

function _createInstance(Func: interfaces.Newable<any>, injections: Object[]): any {
    return new Func(...injections);
}

function getInjections(
    childRequests: interfaces.Request[],
    resolveRequest: (request: interfaces.Request) => any
): any[] {

    let injectionsRequests = childRequests.filter((childRequest: interfaces.Request) => {
        return (childRequest.target !== null && childRequest.target.type === TargetTypeEnum.ConstructorArgument);
    });

    return injectionsRequests.map((childRequest: interfaces.Request) => {
        return resolveRequest(childRequest);
    });

}

function resolveInstance(
    constr: interfaces.Newable<any>,
    childRequests: interfaces.Request[],
    resolveRequest: (request: interfaces.Request) => any
): any {

    if (childRequests.length === 0) {
        return new constr();
    }

    let injections = getInjections(childRequests, resolveRequest);
    let result: any = _createInstance(constr, injections);
    result = _injectProperties(result, childRequests, resolveRequest);

    return result;
}

function resolveStaticFactory(
    staticFactory: interfaces.StaticFactory<any>,
    childRequests: interfaces.Request[],
    resolveRequest: (request: interfaces.Request) => any
): any {

    if (childRequests.length === 0) {
        return staticFactory.create();
    }

    let injections = getInjections(childRequests, resolveRequest);
    let result: any = staticFactory.create(...injections);

    return result;
}


export { resolveInstance, resolveStaticFactory };
