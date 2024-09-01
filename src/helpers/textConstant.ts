const textConstant = {
  requests: "requests",
  created: "created",
  authenticated: "authenticated",
  anonymous: "anonymous",
  newDeliveryRequest: "new_delivery_request",
  noDispatchAvailable: "no_dispatch_available",
  requestAcceptedByDispatch: 'request_accepted_by_dispatch',
  connection: "connection",
  login: "login",
  english: {
    noDispatchAvailableMessage: "No dispatch available",
    messageToRiders: (smsMessageDetails: any) => {
      return `Incoming request from ${smsMessageDetails.name}:  (${smsMessageDetails.pickup_address} - ${smsMessageDetails.delivery_address}), ${smsMessageDetails.hour_time} on ${smsMessageDetails.month_time}`;
    },
  },
};

export default textConstant;
