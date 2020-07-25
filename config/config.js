// ============================
//  General Properties
// ============================
let get = {
    auth: {
        scopes: {
            basic: 'monitoring',
        },
        exclude: ['/', '/about', '/health', '/api/v1','/api/v1/health', '/auth', '/auth/get/credentials' ]
    }
};

module.exports = get;
