import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReportsTable20260527000000 implements MigrationInterface {
  name = 'AddReportsTable20260527000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."report_type_enum" AS ENUM('bug', 'suggestion', 'other')`);
    await queryRunner.query(`CREATE TYPE "public"."report_status_enum" AS ENUM('open', 'in_progress', 'resolved')`);
    await queryRunner.query(`
      CREATE TABLE "reports" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "type" "public"."report_type_enum" NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text NOT NULL,
        "device_info" character varying(255),
        "app_version" character varying(50),
        "status" "public"."report_status_enum" NOT NULL DEFAULT 'open',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reports_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_reports_user_id" ON "reports" ("user_id")`);
    await queryRunner.query(`
      ALTER TABLE "reports"
      ADD CONSTRAINT "FK_reports_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_reports_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_reports_user_id"`);
    await queryRunner.query(`DROP TABLE "reports"`);
    await queryRunner.query(`DROP TYPE "public"."report_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."report_type_enum"`);
  }
}
