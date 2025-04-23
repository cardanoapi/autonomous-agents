const IS_IN_PRODUCTION_MODE = process.env.NEXT_PUBLIC_NODE_ENV === 'production';
const IS_REDUX_LOGGER_DISABLED = process.env.IS_REDUX_LOGGER_DISABLED === 'true';
const BASE_DEPLOY_PATH = process.env.BASE_DEPLOY_PATH ?? '';
const baseProductionDomain = 'agents.cardanoapi.io';
const networkBase = {
    baseApiHost: 'api.' + baseProductionDomain,
    baseManagerHost: 'manager.' + baseProductionDomain
};
type NetworkName = 'preview' | 'preprod' | 'sanchonet';

export const networkConfig: Record<
    'default' | NetworkName | string,
    { name: NetworkName; publicApiUrl: string; govtoolUrl: string }
> = {
    default: {
        name: 'preview',
        publicApiUrl: `https://preview.${networkBase.baseApiHost}/api`,
        govtoolUrl: 'https://govtool.cardanoapi.io'
    },
    preview: {
        name: 'preview',
        publicApiUrl: `https://preview.${networkBase.baseApiHost}/api`,
        govtoolUrl: 'https://preview.gov.tools'
    },
    preprod: {
        name: 'preprod',
        publicApiUrl: `https://preprod.${networkBase.baseApiHost}/api`,
        govtoolUrl: 'https://govtool.cardanoapi.io'
    }
};

export const environments = {
    api: {
        apiUrl: process.env.API_URL,
        publicUrl: process.env.NEXT_PUBLIC_API_URL,
        internalUrl: process.env.API_URL,
        managerUrl: process.env.NEXT_PUBLIC_MANAGER_URL
    },
    network: process.env.NEXT_PUBLIC_NETWORK_NAME || ('preview' as NetworkName),

    // build-time configs
    BASE_DEPLOY_PATH,

    // run-time configg
    GA_MEASUREMENT_ID: process.env.GA_MEASUREMENT_ID,
    MICROSOFT_CLARITY_TRACKING_CODE: process.env.MICROSOFT_CLARITY_TRACKING_CODE,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_URL: process.env.SENTRY_URL,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_RELEASE: process.env.SENTRY_RELEASE,

    // internal configs
    IS_IN_PRODUCTION_MODE,
    IS_REDUX_LOGGER_DISABLED,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV ?? 'development',
    ELASTIC_APM_SERVER_URL: process.env.ELASTIC_APM_SERVER_URL,
    ELASTIC_APM_SERVICE_NAME: process.env.ELASTIC_APM_SERVICE_NAME,
    ELASTIC_APM_ENVIRONMENT: process.env.ELASTIC_APM_ENVIRONMENT,
    APM_ENABLED: process.env.ELASTIC_APM_SERVER_URL && process.env.ELASTIC_APM_SERVICE_NAME,
    NEXT_PUBLIC_IMAGE_TAG: process.env.NEXT_PUBLIC_IMAGE_TAG ?? 'dev',
    GOVTOOL_BASE_URL: 'https://preview.gov.tools',
    NEXT_PUBLIC_ENABLE_AGENT_INSTANCE: process.env.NEXT_PUBLIC_ENABLE_AGENT_INSTANCE === 'true' || false,
    NEXT_PUBLIC_MANAGER_BASE_DOMAIN: process.env.NEXT_PUBLIC_MANAGER_BASE_DOMAIN || '',
    NEXT_PUBLIC_DOCKER_NETWORK_NAME: process.env.NEXT_PUBLIC_DOCKER_NETWORK_NAME || '',
    NEXT_PUBLIC_AGENT_NODE_DOCKER_IMAGE_NAME: process.env.NEXT_PUBLIC_AGENT_NODE_DOCKER_IMAGE_NAME || ''
};

if (typeof window !== 'undefined') {
    if (!environments.api.publicUrl) {
        const domainPrefix = window.location.hostname.split('.')[0] || 'default';
        const config = networkConfig[domainPrefix] || networkConfig['default'];
        environments.network = config.name;
        environments.api.publicUrl = config.publicApiUrl;
        // we in browser, internal url is also publicUrl
        environments.api.apiUrl = config.publicApiUrl;
    } else {
        environments.api.apiUrl = environments.api.publicUrl;
    }
} else {
    environments.api.apiUrl = environments.api.internalUrl;
}

export default environments;
