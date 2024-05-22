export class PSPGatewayService {
  public checkUserAccountCreationAbility(userId: string): boolean {
    return true;
  }

  public async createAccount(
    userId: string,
    accountDetails: any
  ): Promise<boolean> {
    return true;
  }
}

export const pspGatewayService = new PSPGatewayService();
