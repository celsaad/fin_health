import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useTransactionForm } from '@/providers/TransactionFormProvider';

export function AddTransactionFAB() {
    const { t } = useTranslation();
    const { openForm } = useTransactionForm();

    return (
        <Button
            onClick={openForm}
            size="lg"
            className="fixed bottom-24 right-6 rounded-full shadow-lg lg:bottom-6"
            aria-label={t('transactions.addTransaction')}
        >
            <Plus className="size-5" />
        </Button>
    );
}
