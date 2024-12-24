import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Otp, OtpDocument, StatusEnum } from './otp.model';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { handleApplicationError } from 'src/utils/handle-application-error.util';

@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp.name) private readonly otpModel: Model<Otp>) {}

  /**
   * Generate a new OTP and hash it.
   */
  private async generateOtp(): Promise<{
    stringifiedOtp: string;
    hashedOtp: string;
  }> {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000);
      const hashedOtp = await bcrypt.hash(otp.toString(), 10);
      return { stringifiedOtp: otp.toString(), hashedOtp };
    } catch (error) {
      handleApplicationError(error);
    }
  }

  /**
   * Find an existing OTP document by purpose and user ID.
   */
  private async findOtp(
    user_id: mongoose.Types.ObjectId,
    purpose: 'reset-password' | 'withdrawal' | 'account-verification',
  ): Promise<OtpDocument> {
    try {
      const otpDoc = await this.otpModel.findOne({
        purpose,
        user_id,
      });
      if (!otpDoc) {
        throw new NotFoundException(
          'OTP not found for the specified purpose and user.',
        );
      }
      return otpDoc;
    } catch (error) {
      handleApplicationError(error);
    }
  }

  /**
   * Create a new OTP.
   */
  // public async create(
  //   req: Request,
  //   purpose: 'reset-password' | 'withdrawal',
  // ): Promise<{ otpDoc: OtpDocument; stringifiedOtp: string }> {
  //   const user_id = req.user.id;
  //   const { stringifiedOtp, hashedOtp } = await this.generateOtp();
  //   const otpDoc = await this.otpModel.create({
  //     otp: hashedOtp,
  //     purpose,
  //     user_id: user_id,
  //   });

  //   return { otpDoc, stringifiedOtp };
  // }

  /**
   * Create a new OTP instance or update an existing OTP for the given purpose.
   */
  public async createOrUpdate(
    user_id: mongoose.Types.ObjectId,
    purpose: 'reset-password' | 'withdrawal' | 'account-verification',
  ): Promise<{ otpDoc: OtpDocument; stringifiedOtp: string }> {
    try {
      const { stringifiedOtp, hashedOtp } = await this.generateOtp();

      let otpDoc = await this.otpModel.findOne({
        purpose,
        user_id,
      });

      if (!otpDoc) {
        // If no existing OTP, create a new one
        otpDoc = await this.otpModel.create({
          otp: hashedOtp,
          purpose,
          user_id,
        });
      } else {
        otpDoc.otp = hashedOtp;
        otpDoc.status = StatusEnum.Active;
        await otpDoc.save();
      }

      return { otpDoc, stringifiedOtp };
    } catch (error) {
      handleApplicationError(error);
    }
  }

  /**
   * Delete an OTP for the given purpose.
   */
  public async delete(
    user_id: mongoose.Types.ObjectId,
    purpose: 'reset-password' | 'withdrawal' | 'account-verification',
  ): Promise<OtpDocument> {
    try {
      const otpDoc = await this.otpModel.findOneAndDelete({
        purpose,
        user_id,
      });
      if (!otpDoc) {
        throw new NotFoundException('OTP not found for deletion.');
      }
      return otpDoc;
    } catch (error) {
      handleApplicationError(error);
    }
  }

  /**
   * Mark an OTP as 'used' for the given purpose.
   */
  public async markOtpAsUsed(
    user_id: mongoose.Types.ObjectId,
    purpose: 'reset-password' | 'withdrawal' | 'account-verification',
  ): Promise<OtpDocument> {
    try {
      const otpDoc = await this.findOtp(user_id, purpose);

      otpDoc.status = StatusEnum.Used;
      await otpDoc.save();

      return otpDoc;
    } catch (error) {
      handleApplicationError(error);
    }
  }
}
