const Credentials = {
    username: 'esosanya',
    password: 'sosanya'
}

declare global {
    
       var  credentials : typeof Credentials
    
}

globalThis.credentials = Credentials

export {}
