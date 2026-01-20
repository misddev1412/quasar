import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVisitorStatistics1776510000001 implements MigrationInterface {
    name = 'CreateVisitorStatistics1776510000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "visitor_statistics" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "date" date NOT NULL,
                "total_visitors" integer NOT NULL DEFAULT '0',
                "new_visitors" integer NOT NULL DEFAULT '0',
                "returning_visitors" integer NOT NULL DEFAULT '0',
                "total_sessions" integer NOT NULL DEFAULT '0',
                "total_page_views" integer NOT NULL DEFAULT '0',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_visitor_statistics_date" UNIQUE ("date"),
                CONSTRAINT "PK_visitor_statistics_id" PRIMARY KEY ("id")
            )
        `);

        // Backfill data
        await queryRunner.query(`
            INSERT INTO "visitor_statistics" ("date", "total_visitors", "new_visitors", "returning_visitors", "total_sessions", "total_page_views")
            SELECT
                DATE(v.created_at) as "date",
                COUNT(DISTINCT v.id) as "total_visitors",
                COUNT(DISTINCT CASE WHEN v.visitor_type = 'new' THEN v.id END) as "new_visitors",
                COUNT(DISTINCT CASE WHEN v.visitor_type = 'returning' THEN v.id END) as "returning_visitors",
                COUNT(DISTINCT s.id) as "total_sessions",
                COUNT(DISTINCT pv.id) as "total_page_views"
            FROM "visitors" v
            LEFT JOIN "visitor_sessions" s ON s.visitor_id = v.id AND DATE(s.created_at) = DATE(v.created_at)
            LEFT JOIN "page_views" pv ON pv.session_id = s.id AND DATE(pv.created_at) = DATE(v.created_at)
            GROUP BY DATE(v.created_at)
            ON CONFLICT ("date") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "visitor_statistics"`);
    }
}
