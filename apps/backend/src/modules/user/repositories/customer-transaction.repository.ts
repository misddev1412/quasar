import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseRepository } from '@shared/repositories/base-repository.abstract';
import {
  CustomerTransaction,
  CustomerTransactionEntry,
  CustomerTransactionStatus,
  CustomerTransactionType,
  LedgerAccountType,
  LedgerEntryDirection,
} from '../entities/customer-transaction.entity';

export interface TransactionStats {
  totalVolume: number;
  creditVolume: number;
  debitVolume: number;
  pendingCount: number;
  failedCount: number;
  totalTransactions: number;
  uniqueCustomers: number;
}

@Injectable()
export class CustomerTransactionRepository extends BaseRepository<CustomerTransaction> {
  constructor(
    @InjectRepository(CustomerTransaction)
    protected readonly repository: Repository<CustomerTransaction>,
    @InjectRepository(CustomerTransactionEntry)
    private readonly entryRepository: Repository<CustomerTransactionEntry>,
  ) {
    super(repository);
  }

  createDetailedQueryBuilder(alias: string = 'transaction'): SelectQueryBuilder<CustomerTransaction> {
    return this.repository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.customer`, 'customer');
  }

  async getCustomerBalance(customerId: string): Promise<number> {
    const result = await this.entryRepository
      .createQueryBuilder('entry')
      .select(
        `COALESCE(SUM(CASE WHEN entry.entryDirection = :credit THEN entry.amount ELSE -entry.amount END), 0)`,
        'balance',
      )
      .where('entry.ledgerAccount = :ledgerAccount', { ledgerAccount: LedgerAccountType.CUSTOMER_BALANCE })
      .andWhere('transaction.customerId = :customerId', { customerId })
      .andWhere('transaction.status = :completed', { completed: CustomerTransactionStatus.COMPLETED })
      .innerJoin('entry.transaction', 'transaction')
      .setParameters({ credit: LedgerEntryDirection.CREDIT })
      .getRawOne<{ balance: string }>();

    return Number(result?.balance ?? 0);
  }

  async getAggregatedStats(filters?: { currency?: string; startDate?: Date; endDate?: Date }): Promise<TransactionStats> {
    const baseBuilder = this.repository
      .createQueryBuilder('transaction')
      .leftJoin('currencies', 'currency', 'currency.code = transaction.currency');
    this.applyFilters(baseBuilder, filters);
    const exchangeRateExpression = 'COALESCE(currency.exchange_rate, 1)';

    const totalVolumeResult = await baseBuilder
      .clone()
      .select(
        `COALESCE(SUM((CASE WHEN transaction.impact_direction = :credit THEN transaction.impact_amount ELSE -transaction.impact_amount END) * ${exchangeRateExpression}), 0)`,
        'totalVolume',
      )
      .setParameters({ credit: LedgerEntryDirection.CREDIT })
      .getRawOne<{ totalVolume: string }>();

    const creditVolumeResult = await baseBuilder
      .clone()
      .select(
        `COALESCE(SUM(CASE WHEN transaction.impact_direction = :credit THEN transaction.impact_amount * ${exchangeRateExpression} ELSE 0 END), 0)`,
        'creditVolume',
      )
      .setParameters({ credit: LedgerEntryDirection.CREDIT })
      .getRawOne<{ creditVolume: string }>();

    const debitVolumeResult = await baseBuilder
      .clone()
      .select(
        `COALESCE(SUM(CASE WHEN transaction.impact_direction = :debit THEN transaction.impact_amount * ${exchangeRateExpression} ELSE 0 END), 0)`,
        'debitVolume',
      )
      .setParameters({ debit: LedgerEntryDirection.DEBIT })
      .getRawOne<{ debitVolume: string }>();

    const statusResult = await baseBuilder
      .clone()
      .select('COUNT(*)', 'totalTransactions')
      .addSelect(
        `SUM(CASE WHEN transaction.status = :pending THEN 1 ELSE 0 END)`,
        'pendingCount',
      )
      .addSelect(
        `SUM(CASE WHEN transaction.status = :failed THEN 1 ELSE 0 END)`,
        'failedCount',
      )
      .setParameters({
        pending: CustomerTransactionStatus.PENDING,
        failed: CustomerTransactionStatus.FAILED,
      })
      .getRawOne<{ totalTransactions: string; pendingCount: string; failedCount: string }>();

    const uniqueCustomersResult = await baseBuilder
      .clone()
      .select('COUNT(DISTINCT transaction.customerId)', 'uniqueCustomers')
      .getRawOne<{ uniqueCustomers: string }>();

    return {
      totalVolume: Number(totalVolumeResult?.totalVolume ?? 0),
      creditVolume: Number(creditVolumeResult?.creditVolume ?? 0),
      debitVolume: Number(debitVolumeResult?.debitVolume ?? 0),
      pendingCount: Number(statusResult?.pendingCount ?? 0),
      failedCount: Number(statusResult?.failedCount ?? 0),
      totalTransactions: Number(statusResult?.totalTransactions ?? 0),
      uniqueCustomers: Number(uniqueCustomersResult?.uniqueCustomers ?? 0),
    };
  }

  async getCompletedOrderPaymentTotals(orderId: string): Promise<{
    totalPaid: number;
    transactionCount: number;
  }> {
    if (!orderId) {
      return { totalPaid: 0, transactionCount: 0 };
    }

    const result = await this.repository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(ABS(transaction.impactAmount)), 0)', 'totalPaid')
      .addSelect('COUNT(*)', 'transactionCount')
      .where('transaction.relatedEntityType = :entityType', { entityType: 'order' })
      .andWhere('transaction.relatedEntityId = :orderId', { orderId })
      .andWhere('transaction.type = :transactionType', {
        transactionType: CustomerTransactionType.ORDER_PAYMENT,
      })
      .andWhere('transaction.status = :status', {
        status: CustomerTransactionStatus.COMPLETED,
      })
      .getRawOne<{ totalPaid: string; transactionCount: string }>();

    return {
      totalPaid: Number(result?.totalPaid ?? 0),
      transactionCount: Number(result?.transactionCount ?? 0),
    };
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<CustomerTransaction>,
    filters?: { currency?: string; startDate?: Date; endDate?: Date },
  ): SelectQueryBuilder<CustomerTransaction> {
    if (filters?.currency) {
      queryBuilder.andWhere('transaction.currency = :currency', { currency: filters.currency });
    }
    if (filters?.startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', { startDate: filters.startDate });
    }
    if (filters?.endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return queryBuilder;
  }
}
