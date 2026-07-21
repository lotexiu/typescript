import { TValueListener, TValueUnsubscribe } from "@ts/subscription/types";

type TSubscription = {
	subscribe(listener: TValueListener<any>): TValueUnsubscribe
}

export type {
	TSubscription
}