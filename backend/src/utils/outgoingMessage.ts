import {z} from 'zod';
import { Roles } from './roomTypes';

export enum supportedMessage {
    roleAssign = "role_assign",

}

export type outgoingMessage = {
    type: supportedMessage.roleAssign,
    payload: roleAssignPayloadType
}

const roleAssignPayload = z.object({
    role: z.string()
})
type roleAssignPayloadType = z.infer<typeof roleAssignPayload>

