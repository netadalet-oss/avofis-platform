export type LocalReply = Readonly<{ id: string; body: string }>;
export type LocalTopic = Readonly<{
  id: string;
  title: string;
  description: string;
  replies: readonly LocalReply[];
}>;
export const MAX_TOPICS = 20;
export const MAX_REPLIES = 20;

export function addTopic(
  items: readonly LocalTopic[], id: string, title: string, description: string
): LocalTopic | null {
  const cleanTitle = title.trim(), cleanDescription = description.trim();
  if (!id || items.some((x) => x.id === id) || items.length >= MAX_TOPICS ||
      !cleanTitle || !cleanDescription || cleanTitle.length > 160 ||
      cleanDescription.length > 5000) return null;
  return { id, title: cleanTitle, description: cleanDescription, replies: [] };
}
export function addReply(
  items: readonly LocalTopic[], topicId: string, replyId: string, body: string
): LocalTopic[] | null {
  const text = body.trim();
  if (!text || text.length > 3000) return null;
  const topic = items.find((x) => x.id === topicId);
  if (!topic || topic.replies.length >= MAX_REPLIES ||
      topic.replies.some((x) => x.id === replyId)) return null;
  return items.map((item) => item.id === topicId
    ? { ...item, replies: [...item.replies, { id: replyId, body: text }] } : item);
}
export function searchTopics(items: readonly LocalTopic[], query: string): LocalTopic[] {
  const term = query.trim().toLocaleLowerCase("tr-TR");
  if (!term) return [...items];
  return items.filter((item) =>
    (item.title + " " + item.description).toLocaleLowerCase("tr-TR").includes(term)
  );
}
export function removeTopic(items: readonly LocalTopic[], id: string): LocalTopic[] {
  return items.filter((item) => item.id !== id);
}
export function removeReply(
  items: readonly LocalTopic[], topicId: string, replyId: string
): LocalTopic[] {
  return items.map((item) => item.id === topicId
    ? { ...item, replies: item.replies.filter((r) => r.id !== replyId) } : item);
}
