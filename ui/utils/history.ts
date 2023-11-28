export function historyActionPretty(action: string) {
  switch(action) {
    case "item-created":
      return "Created";
    case "item-edited":
      return "Edited";
  }

  return `Action: ${action}`
}