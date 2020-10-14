import {Octokit} from '@octokit/rest';
import {
	StrategyInterface,
	RequestInterface,
	Route,
	EndpointOptions,
	RequestParameters,
	EndpointDefaults,
	OctokitResponse
} from '@octokit/types';

import optionsStorage from '../options-storage';

type AnyResponse = OctokitResponse<any>;
interface TokenAuthentication {
	type: 'token';
	token: string;
}
interface Unauthenticated {
	type: 'unauthenticated';
}

type Authentication = TokenAuthentication | Unauthenticated;
type AuhtStrategyInterface = StrategyInterface<[], [], Authentication>;

const authStrategy: AuhtStrategyInterface = function () {
	const auth = async (): Promise<Authentication> => {
		const {personalToken} = await optionsStorage.getAll();
		return personalToken ? {type: 'token', token: personalToken} : {type: 'unauthenticated'};
	};

	auth.hook = async function (
		request: RequestInterface,
		route: Route | EndpointOptions,
		parameters?: RequestParameters
	): Promise<AnyResponse> {
		const endpoint: EndpointDefaults = request.endpoint.merge(
			route as string,
			parameters
		);

		const authentication = await auth();
		if (authentication.type === 'token') {
			endpoint.headers.authorization = `bearer ${authentication.token}`;
		}

		return request(endpoint as EndpointOptions);
	};

	return auth;
};

const octokit = new Octokit({authStrategy});

export default octokit;
