import type Phaser from 'phaser';

export function getMatterBody(
  image: Phaser.Physics.Matter.Image,
): MatterJS.BodyType | null {
  const body = image.body;
  if (!body || !('bounds' in body) || !('parts' in body)) {
    return null;
  }

  return body as MatterJS.BodyType;
}
