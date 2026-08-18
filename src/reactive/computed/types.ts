import { TValueListener, TValueUnsubscribe } from "../model/types";

type TSubscription = {
	subscribe(listener: TValueListener<any>): TValueUnsubscribe
}

export type {
	TSubscription
}