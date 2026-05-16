import { expect, type Locator, type Page } from '@playwright/test';

export interface PickedBoxStyles {
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
  paddingLeft: string;
  paddingRight: string;
}

export interface PickedMetaStyles {
  display: string;
  flexDirection: string;
  alignItems: string;
  textAlign: string;
}

export async function pickBoxStyles(
  locator: Locator,
): Promise<PickedBoxStyles> {
  return locator.first().evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fontFamily: style.fontFamily,
      paddingLeft: style.paddingLeft,
      paddingRight: style.paddingRight,
    };
  });
}

export async function pickMetaStyles(
  locator: Locator,
): Promise<PickedMetaStyles> {
  return locator.first().evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      display: style.display,
      flexDirection: style.flexDirection,
      alignItems: style.alignItems,
      textAlign: style.textAlign,
    };
  });
}

export function expectMonospaceFont(fontFamily: string): void {
  expect(fontFamily.toLowerCase()).toMatch(/geist mono|ui-monospace|monospace/);
}

export async function pickStyles(
  page: Page,
  selector: string,
): Promise<PickedBoxStyles> {
  return pickBoxStyles(page.locator(selector));
}
