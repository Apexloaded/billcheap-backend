import ShortUniqueId from 'short-unique-id';

export const generateId = ({
  length = 6,
  ...prop
}: Partial<ShortUniqueId.ShortUniqueIdOptions>) => {
  const uid = new ShortUniqueId({ length, ...prop });
  return uid.randomUUID();
};
