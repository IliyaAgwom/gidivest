import { Users, DollarSign, ArrowUpFromLine, Activity } from "lucide-react";

export default function AdminOverview() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
        <p className="text-navy-400">System statistics and pending actions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-navy-800 p-6 rounded-2xl border border-navy-700">
           <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-emerald-900/50 rounded-xl text-emerald-400"><DollarSign className="w-6 h-6" /></div>
              <h3 className="text-navy-300 font-medium">Total AUM</h3>
           </div>
           <p className="text-3xl font-bold text-white">$1,450,230</p>
        </div>
        <div className="bg-navy-800 p-6 rounded-2xl border border-navy-700">
           <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-navy-700 rounded-xl text-white"><Users className="w-6 h-6" /></div>
              <h3 className="text-navy-300 font-medium">Active Users</h3>
           </div>
           <p className="text-3xl font-bold text-white">1,204</p>
        </div>
        <div className="bg-navy-800 p-6 rounded-2xl border border-navy-700">
           <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gold-900/50 rounded-xl text-gold-400"><Activity className="w-6 h-6" /></div>
              <h3 className="text-navy-300 font-medium">Pending Deposits</h3>
           </div>
           <p className="text-3xl font-bold text-white">12</p>
        </div>
        <div className="bg-navy-800 p-6 rounded-2xl border border-navy-700">
           <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-red-900/50 rounded-xl text-red-400"><ArrowUpFromLine className="w-6 h-6" /></div>
              <h3 className="text-navy-300 font-medium">Pending Withdrawals</h3>
           </div>
           <p className="text-3xl font-bold text-white">5</p>
        </div>
      </div>
      
      {/* Pending Actions List */}
      <div className="bg-navy-800 rounded-2xl border border-navy-700 overflow-hidden">
        <div className="p-6 border-b border-navy-700">
          <h3 className="text-lg font-bold text-white">Action Required</h3>
        </div>
        <div className="p-6">
          <p className="text-navy-400">Review the Deposits and Withdrawals tabs to process pending user transactions.</p>
        </div>
      </div>
    </div>
  );
}
