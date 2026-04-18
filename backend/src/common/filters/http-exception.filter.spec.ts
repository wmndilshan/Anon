import { HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

function makeHost(method = 'GET', url = '/test') {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const res = { status } as any;
  const req = { method, url } as any;
  return {
    host: {
      switchToHttp: () => ({ getResponse: () => res, getRequest: () => req }),
    } as any,
    res,
    req,
    json,
    status,
  };
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
  });

  it('maps HttpException to the correct status code', () => {
    const { host, status, json } = makeHost();
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
    filter.catch(exception, host);
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, path: '/test' }),
    );
  });

  it('maps unknown errors to 500', () => {
    const { host, status } = makeHost();
    filter.catch(new Error('boom'), host);
    expect(status).toHaveBeenCalledWith(500);
  });

  it('includes the path in the response body', () => {
    const { host, json } = makeHost('POST', '/api/v1/orders');
    filter.catch(new HttpException('Bad Request', 400), host);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ path: '/api/v1/orders' }));
  });

  it('includes a timestamp in the response body', () => {
    const { host, json } = makeHost();
    filter.catch(new HttpException('Conflict', 409), host);
    const [arg] = json.mock.calls[0];
    expect(arg).toHaveProperty('timestamp');
    expect(typeof arg.timestamp).toBe('string');
  });

  it('spreads object response from HttpException', () => {
    const { host, json } = makeHost();
    const exception = new HttpException({ message: 'Validation failed', errors: [] }, 422);
    filter.catch(exception, host);
    const [arg] = json.mock.calls[0];
    expect(arg).toMatchObject({ message: 'Validation failed', errors: [] });
  });
});
