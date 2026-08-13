import { Request, Response } from "express";
import * as skillService from "../services/skill.service";

export async function listSkillsHandler(_req: Request, res: Response): Promise<void> {
  const skills = await skillService.listSkills();
  res.json(skills);
}

export async function getSkillHandler(req: Request, res: Response): Promise<void> {
  const skill = await skillService.getSkillById(req.params.id);
  res.json(skill);
}
