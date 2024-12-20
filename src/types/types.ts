import { Admin } from 'src/modules/admin/admin.model';
import { User } from 'src/modules/user/user.model';

export interface UserInterface extends User {
  id: string;
}
export interface AdminInterface extends Admin {
  id: string;
}
