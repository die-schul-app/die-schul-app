export class MissingToken extends Error {
  constructor() {
    super('DSB authentication token is missing');
    this.name = 'MissingToken';
  }
}

export class IncompatiblePlan extends Error {
  constructor() {
    super('The timetable format is incompatible or could not be parsed');
    this.name = 'IncompatiblePlan';
  }
}

export class AuthenticationError extends Error {
  constructor() {
    super('DSB authentication failed - check username and password');
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(`Network error: ${message}`);
    this.name = 'NetworkError';
  }
}
