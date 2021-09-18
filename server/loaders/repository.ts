import { Container } from 'typedi';
import Domain from '@brokerbay/domain';
import type { Connection } from 'mongoose';

type RepositoryLoaderArg = {
  Container: typeof Container;
  db: Domain;
  connection: Connection;
};

const repositoryLoader = ({ db, connection  }: RepositoryLoaderArg) => {
  /** Instantiate a class and register it to the `type-di` container */
  const create = <T, R extends unknown[]>(
    Class: new (...args: R) => T,
    args: R,
  ) => {
    const instance = new Class(...args);
    Container.set(Class, instance);
    return instance;
  };

  return {
    CustomerSuccessUserRepository: create(CustomerSuccessUserRepository, [
      prisma.customerSuccessUser,
    ]),
    CommentRepository: create(CommentRepository, [prisma.comment]),
    OrgAssociationRepository: Container.get(OrgAssociationRepository),
    OrgContactsRepository: create(OrgContactsRepository, [connection]),
    OrgCustomerSuccessRepository: create(OrgCustomerSuccessRepository, [
      prisma.orgCustomerSuccess,
    ]),
    OrgRepository: Container.get(MongoOrgRepository),
    ChargeSettingsRepository: create(ChargeSettingsRepository, [
      db.ChargeSettings,
    ]),
    NewOIDRepository: create(NewOIDRepository, [prisma.newOID]),
    StripeCustomerRepository: create(StripeCustomerRepository, [
      db.StripeCustomer,
    ]),
    OnboardingRepository: create(OnboardingRepository, [
      prisma.onboarding,
      prisma.stage,
    ]),
    OnboardingSubmitterRepository: create(OnboardingSubmitterRepository, [
      prisma.onboardingSubmitter,
    ]),
    PricingRepository: create(PricingRepository, [db.Pricing]),
    StageRepository: create(StageRepository, [prisma.stage]),
    TaskRepository: create(TaskRepository, [prisma.task]),
    ToolsJobLogRepository: create(ToolsJobLogRepository, [
      connection.collection('joblogs_tools'),
    ]),
    ToolsMailingBlacklistRepository: create(ToolsMailingBlacklistRepository, [
      connection.collection('mailingblacklist'),
    ]),
    UserVerificationWhitelistItemRepository: create(
      UserVerificationWhitelistItemRepository,
      [connection.collection('userverificationwhitelistitem')],
    ),
    BoardRepository: Container.get(BoardRepository),
    OrgJobLogRepository: create(OrgJobLogRepository, [
      connection.collection('joblogs_orgs'),
    ]),
    MLSRepository: create(MLSRepository, [connection.collection('retsmls')]),
    OnboardingPortalRepository: create(OnboardingPortalRepository, [
      connection.collection('onboardingportal'),
      connection.collection('onboardingportalAssociation'),
    ]),
    StripeClientInfoRepository: create(StripeClientInfoRepository, [
      connection.collection('stripeclientinfo'),
    ]),
  };
};

export default repositoryLoader;

export type Repositories = ReturnType<typeof repositoryLoader>;
