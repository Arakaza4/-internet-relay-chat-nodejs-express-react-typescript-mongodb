export default class Tools {
    static getCookie = (name: string) => {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies)
        {
            const [cookieName, cookieValue] = cookie.trim().split('=');
            if (cookieName === name)
            {
                return decodeURIComponent(cookieValue);
            }
        }
        return '';
    };

    static setCookie = (name: string, item: any) => {

        //  creation d'un cookie
        let now: Date  = new Date();
        let time: number = now.getTime();
        let expireTime: number = time + 1000*36000;
        now.setTime(expireTime);
        document.cookie = `${name}=${item};expires=${now.toUTCString()}; path=/;SameSite=Lax`;
    }

    static deleteCookie = (name: string) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }

    static deleteAllCookies = () => {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [cookieName] = cookie.trim().split('=');
            
            // Delete each cookie by setting its expiration date to the past
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
    };
}