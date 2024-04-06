
const getEnvByName = (name: string, defaultValue?: string): string | undefined => {
    return process.env[name] ?? defaultValue;
}

const getSignersPrivateKeys = (): string[] => {
    return getEnvByName('PRIVATE_KEYS')!.split(',');
}

const getNetworkName = () => {
    return getEnvByName('NETWORK_NAME');
}


export { getEnvByName, getSignersPrivateKeys, getNetworkName }