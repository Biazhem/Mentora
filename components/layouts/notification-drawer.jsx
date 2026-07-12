import { Drawer } from "@heroui/react";
import { Description } from "@heroui/react";
import { Button, Label } from "@heroui/react";
import { Bell } from "lucide-react";
import Link from "next/link";

export default function NotificationButton() {
  return (
    <Drawer>
      <Button isIconOnly size="lg">
        <Bell />
      </Button>
      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.Header>
              <Drawer.Heading>Notifications</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body>
              <div className="flex flex-col">
                {[1, 2, 3, 4, 5].map((itm, idx) => (
                  <Link href="">
                    <Button
                      size="lg"
                      variant="secondary"
                      className={`flex flex-col items-start justify-start p-2 h-fit m-0 ${idx === 0 ? "rounded-b-sm" : idx === 5 - 1 ? "rounded-t-sm" : "rounded-none"}`}
                      fullWidth
                    >
                      <Label>New Message</Label>
                      <Description className="line-clamp-1">
                        How are you from someone user
                      </Description>
                    </Button>
                  </Link>
                ))}
              </div>
            </Drawer.Body>
            <Drawer.Footer>
              <Button slot="close" variant="secondary">
                Cancel
              </Button>
              <Button slot="close">Confirm</Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
