import { Request, Response } from "express";
import * as developerService from "../services/developer.service";

export async function listDevelopersHandler(_req: Request, res: Response): Promise<void> {
  const developers = await developerService.listDevelopers();
  res.json(developers);
}

export async function getDeveloperHandler(req: Request, res: Response): Promise<void> {
  const developer = await developerService.getDeveloperById(req.params.id);
  res.json(developer);
}
