import React from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Title, Description } from "@storybook/addon-docs";

import { CameraBubble } from "./camera_bubble";

export default {
  title: "RapidRec/CameraBubble",
  component: CameraBubble,
  parameters: {
    docs: {
      page: () => (
        <>
          <Title>CameraBubble</Title>
          <Description>
            Bubble which shows on `Screen And Camera` mode
          </Description>
          <CameraBubble />
        </>
      ),
    },
  },
} as ComponentMeta<typeof CameraBubble>;

const Template: ComponentStory<typeof CameraBubble> = () => <CameraBubble />;

export const Default = Template.bind({});
