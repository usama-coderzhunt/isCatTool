import CustomTextField from '@/@core/components/mui/TextField'
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface SubscriptionRefundModalProps {
    open: boolean
    onClose: () => void
    onConfirm: (data: { reason: string; amount?: number }) => void
    isLoading?: boolean
}

const SubscriptionRefundModal = ({ open, onClose, onConfirm, isLoading }: SubscriptionRefundModalProps) => {
    const { t } = useTranslation('global')
    const [reason, setReason] = useState('')
    const [amount, setAmount] = useState<string>('')

    const handleConfirm = () => {
        const data: { reason: string; amount?: number } = { reason }
        if (amount && !isNaN(Number(amount))) {
            data.amount = Number(amount)
        }
        onConfirm(data)
        setReason('')
        setAmount('')
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle className="bg-primary text-white py-6 px-8 text-2xl font-semibold">
                {t('subscriptions.subscriptionRefundModal.title')}
            </DialogTitle>
            <DialogContent className="p-8">
                <div className="mb-8">
                    <Typography variant="h6" className="text-gray-900 mb-4">
                        {t('subscriptions.subscriptionRefundModal.message')}
                    </Typography>
                    <Typography variant="body1" className="text-gray-600 mb-4">
                        {t('subscriptions.subscriptionRefundModal.warning')}
                    </Typography>
                    <div className="space-y-4">
                        <CustomTextField
                            showAsterisk={true}
                            fullWidth
                            multiline
                            rows={4}
                            label={t('subscriptions.subscriptionRefundModal.reason')}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <CustomTextField
                            fullWidth
                            type="number"
                            label={t('subscriptions.subscriptionRefundModal.amount')}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                </div>
            </DialogContent>
            <DialogActions className="p-6 bg-white border-t border-gray-200">
                <Button
                    onClick={onClose}
                    variant="outlined"
                    className="px-6 py-2 rounded-lg font-semibold normal-case hover:bg-gray-50"
                    disabled={isLoading}
                >
                    {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color="primary"
                    disabled={isLoading || !reason.trim()}
                    className="px-6 py-2 rounded-lg font-semibold normal-case shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <CircularProgress size={20} color="inherit" />
                        </div>
                    ) : (
                        t('subscriptions.subscriptionRefundModal.confirm')
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default SubscriptionRefundModal 
