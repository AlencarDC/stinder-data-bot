import { Page } from 'puppeteer';
import faker from 'faker';
import { formatISO9075 } from 'date-fns';

import { Achievement, getAchievementsByUrl } from './achievement';

export interface Game {
  developer?: number;
  name: string;
  thumbnail: string;
  releaseDate: string;
  tags: string[];
  achievements: Achievement[];
}

export async function getGameByUrl(url: string, page: Page): Promise<Game | undefined> {
  await page.goto(url);

  const gameName = await page.$eval('.apphub_AppName', el => el.innerHTML);
  const gameThumb = await page.$eval('img.game_header_image_full', img => img.getAttribute('src'));

  const moreButton = await page.$('div.add_button');
  moreButton && await moreButton.click();
  const gameTags = await page.$$eval('.app_tag_control a.app_tag', els => els.map(el=> el.innerHTML.replace(/\t/g, '')));

  const achievementLink = await page.$eval('a.communitylink_achivement_plusmore', a => a.getAttribute('href'));
  const achievements = await getAchievementsByUrl(achievementLink as string, page);


  if (gameName && gameThumb && gameTags) {
    return {
      name: gameName,
      thumbnail: gameThumb,
      releaseDate: formatISO9075(faker.date.past(2, new Date())),
      tags: gameTags,
      achievements,
    };
  }
}