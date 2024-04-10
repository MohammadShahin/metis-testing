
const getEnvByName = (name: string, defaultValue?: string): string | undefined => {
    return process.env[name] ?? defaultValue;
}

const getSignersPrivateKeys = (): string[] => {
    return getEnvByName('PRIVATE_KEYS')!.split(',');
}

const getNetworkName = () => {
    return getEnvByName('NETWORK_NAME');
}

const getNetworkHeaders = (headersEnvName: string): Record<string, string> => {
    const headers = getEnvByName(headersEnvName);
    if (!headers) {
        return {};
    }
    return JSON.parse(headers);
}

export { getEnvByName, getSignersPrivateKeys, getNetworkName, getNetworkHeaders }