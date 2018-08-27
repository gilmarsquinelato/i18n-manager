export const setupSentry = (sentryInstance: any) => {
  sentryInstance.init({
    dsn: 'https://f55d7c8072cd44d7897d43c9b5294d3d@sentry.io/1268922',
  });
};
