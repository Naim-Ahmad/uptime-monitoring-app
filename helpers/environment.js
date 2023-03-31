// module scaffolding
const environment = {};

environment.development = {
    port: 3000,
    mode: 'development',
    key: 'mamun201103',
    caller: '+15074311541',
    TWILIO_ACCOUNT_SID: 'AC0103e43155134f77322c1d8cc96afe85',
    TWILIO_AUTH_TOKEN: '5b5b7a19219fe30615f6c4af2b974a69',
};

environment.production = {
    port: 5000,
    mode: 'production',
    key: 'mamun201103',
    caller: '+15074311541',
    TWILIO_ACCOUNT_SID: 'AC0103e43155134f77322c1d8cc96afe85',
    TWILIO_AUTH_TOKEN: '5b5b7a19219fe30615f6c4af2b974a69',
};

const currentEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'development';

const envToExp =
    typeof environment[currentEnv] === 'object' ? environment[currentEnv] : environment.development;

module.exports = envToExp;
