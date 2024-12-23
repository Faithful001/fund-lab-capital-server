import mongoose from 'mongoose';
import { Admin } from 'src/modules/admin/admin.model';
import { User } from 'src/modules/user/user.model';

export interface UserInterface extends Pick<User, 'role'> {
  // id: string;
  _id: mongoose.Types.ObjectId;
}
export interface AdminInterface extends Pick<Admin, 'role'> {
  // id: string;
  _id: mongoose.Types.ObjectId;
}
