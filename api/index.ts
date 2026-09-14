import type { Request, Response } from 'express';

import { createApp } from '../src/main';

let server: ((req: Request, res: Response) => void) | undefined;

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  if (!server) {
    const app = await createApp();

    server = app.getHttpAdapter().getInstance() as (
      req: Request,
      res: Response,
    ) => void;
  }

  server(req, res);
}
