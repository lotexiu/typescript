import { TValueListener, TValueUnsubscribe } from "../types";

type TSubscription = {
	subscribe(listener: TValueListener<any>): TValueUnsubscribe
}

export type {
	TSubscription
}