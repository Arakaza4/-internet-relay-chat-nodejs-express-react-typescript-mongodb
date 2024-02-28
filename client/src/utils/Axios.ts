import axios, { AxiosResponse } from 'axios';

export default class AxiosTools
{
    static urlRequested = window.location.protocol + '//' + window.location.hostname + ':5000/';

    static config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    
    static async post<T>(route: string, postData: unknown, callback: (response: AxiosResponse<T>) => void)
    {
        try
        {
            const response = await axios.post(AxiosTools.urlRequested + route, postData, this.config);
    
            callback(response);
        }
        catch (error)
        {
            console.error(error);
        }
    }

    static async get<T>(route: string, callback: (response: AxiosResponse<T>) => void)
    {
        try
        {
            const response = await axios.get<T>(AxiosTools.urlRequested + route, this.config);
    
            callback(response);
        }
        catch (error)
        {
            console.error(error);
        }
    }

    static async put<T>(route: string, postData: unknown, callback: (response: AxiosResponse<T>) => void)
    {
        try
        {
            const response = await axios.put<T>(AxiosTools.urlRequested + route, postData, this.config);
    
            callback(response);
        }
        catch (error)
        {
            console.error(error);
        }
    }

    static async delete<T>(route: string, callback: (response: AxiosResponse<T>) => void)
    {
        try
        {
            const response = await axios.delete<T>(AxiosTools.urlRequested + route, this.config);
    
            callback(response);
        }
        catch (error)
        {
            console.error(error);
        }
    }
}
