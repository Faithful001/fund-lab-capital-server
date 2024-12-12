import { Injectable } from '@nestjs/common';

@Injectable() // Remove the scope option to make it a singleton
export class UserRequestService {
  private user: { id: string; role: string } | null = null;

  public setUser(id: string, role: string) {
    this.user = { id, role };
  }

  public getUser() {
    return this.user;
  }
}
