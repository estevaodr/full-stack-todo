import type { Meta, StoryObj } from '@storybook/angular';
import { FeatureRegister } from './feature-register';
import { expect } from 'storybook/test';

const meta: Meta<FeatureRegister> = {
  component: FeatureRegister,
  title: 'FeatureRegister',
};
export default meta;

type Story = StoryObj<FeatureRegister>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/feature-register/gi)).toBeTruthy();
  },
};
