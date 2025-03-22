import mongoose, {Schema} from 'mongoose';

const SubscriptionSchema = new Schema({

  subscriber:{
    type: Schema.Types.ObjectId,// one who is subscibing
    ref:'User'
  },
  chhanel:{
    type:Schema.Types.ObjectId,// one who is being subscibed
    ref:'User'
  }
  
},{timestamps:true}
);

export const Subscription = mongoose.model('Subscription', SubscriptionSchema);

