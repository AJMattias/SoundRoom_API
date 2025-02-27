class PasswordTokens {
    tokens: any;
    constructor() {
        this.tokens = {}
    }
    createToken(email: string): string  {
      let token  = ""
      for(let i = 0 ; i<6 ; i++) {
          token += `${Math.round(Math.random() * 10)}`
      }
      this.tokens[email] = token  
      return token
    }

    checkToken(email: string  , token: string): boolean {
        return this.tokens[email] == token
    }
}


export const passwordTokens = new PasswordTokens()