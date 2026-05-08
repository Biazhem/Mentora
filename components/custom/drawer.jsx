import { Input } from "@heroui/react";
import { Avatar } from "@heroui/react";
import { Drawer, Button } from "@heroui/react";
import { Send } from "lucide-react";
import { MessageCircleMore } from "lucide-react";
import { messages } from "@/config/data";
import { Link2 } from "lucide-react";
export function FabButton() {
  return (
    <Drawer>
      <Button
        isIconOnly
        variant="primary"
        color="primary"
        className={"fixed bottom-6 right-6 shadow-2xl h-16 w-16"}
        onPress={() => console.log("FAB pressed")}
      >
        <MessageCircleMore className="size-5" />
      </Button>
      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.Header>
              <Drawer.Heading>Chats</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="border-b-2 border-accent">
              <div className="flex gap-2 flex-col">
                {messages.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 ${item.type === "self" ? "flex-row-reverse" : "justify-start"}`}
                  >
                    <Avatar size="sm">
                      <Avatar.Fallback>{item.avatar}</Avatar.Fallback>
                    </Avatar>
                    <div className="flex flex-col items-end">
                      <p
                        className={`w-fit rounded-lg px-3 py-2 text-sm ${
                          item.type === "self"
                            ? "bg-primary text-primary-foreground self-end"
                            : "bg-muted/40 text-foreground"
                        }`}
                      >
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Drawer.Body>
            <Drawer.Footer className="flex items-center">
              <Button isIconOnly>
                <Link2 />
              </Button>
              <Input type="text" placeholder="Messeges" className={"flex-1"} />
              <Button isIconOnly>
                <Send />
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
