export const timestampToDate = (timestamp: any, inSeconds?: boolean) => {
  return new Date(inSeconds !== false ? parseInt(timestamp) * 1e3 : parseInt(timestamp))
    .toString()
    .split(' ')
    .slice(0, 4)
    .join(' ')
}
