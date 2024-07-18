import axios from 'axios';
import {formatPhoneNumber} from "./functions";
import {constants} from "./constants";
export class Termii {

    public phoneNumber: string | undefined;
    public message: string | undefined;
    public business: string | undefined;

    constructor(phoneNumber: string, message: string, business= 'Vamooze') {
        this.phoneNumber = phoneNumber;
        this.message = message;
        this.business = business;
    }

    public async sendSMS() {

        const phone = formatPhoneNumber(this.phoneNumber);

        const data = {
            "to": phone,
            "from": this.business,
            "sms": this.message,
            "type": "plain",
            "api_key": constants.termii.apiKey,
            "channel": "generic"
        };

        const options = {
            method: 'POST',
            url: `https://${constants.termii.baseUrl}/api/sms/send`,
            headers: {
                'Content-Type': 'application/json'
            },
            data
        };

        console.log('===========================================options');
        console.log(options);
        console.log('===========================================options');

            try {
                const response = await axios(options);
                console.log(response.data);
            } catch (error) {
                console.error(error);
            }

    }
}