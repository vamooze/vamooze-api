import axios from "axios";
import { formatPhoneNumber } from "./functions";
import { constants } from "./constants";
import { logger } from "../logger";

export class Termii {
  private business: string;

  constructor(business = "Loystar") {
    this.business = business;
  }

  private async sendSingleSMS(phoneNumber: string, message: string): Promise<boolean> {
    const phone = formatPhoneNumber(phoneNumber);

    const data = {
      to: phone,
      from: this.business,
      sms: message,
      type: "plain",
      api_key: constants.termii.apiKey,
      channel: "generic",
    };

    const options = {
      method: "POST",
      url: `https://${constants.termii.baseUrl}/api/sms/send`,
      headers: {
        "Content-Type": "application/json",
      },
      data,
    };

    try {
      const response = await axios(options);
      logger.info(`SMS sent successfully to ${phone}`);
      logger.debug(JSON.stringify(response.data, null, 2));
      return true;
    } catch (error) {
      logger.error(`Failed to send SMS to ${phone}: ${error}`);
      return false;
    }
  }

  public async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    return this.sendSingleSMS(phoneNumber, message);
  }

  public async sendBatchSMS(phoneNumbers: string[], message: string): Promise<{ success: string[], failed: string[] }> {
    const results = await Promise.all(
      phoneNumbers.map(async (phone) => {
        const success = await this.sendSingleSMS(phone, message);
        return { phone, success };
      })
    );

    const successfulNumbers = results.filter(r => r.success).map(r => r.phone);
    const failedNumbers = results.filter(r => !r.success).map(r => r.phone);

    logger.info(`Batch SMS sending completed. Success: ${successfulNumbers.length}, Failed: ${failedNumbers.length}`);

    return {
      success: successfulNumbers,
      failed: failedNumbers
    };
  }
}