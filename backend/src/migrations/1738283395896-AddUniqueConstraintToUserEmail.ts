import {
  MigrationInterface,
  QueryRunner,
  TableIndex,
  TableUnique,
} from "typeorm";

export class AddUniqueConstraintToUserEmail1738283395896
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createUniqueConstraint(
      "users",
      new TableUnique({
        name: "UQ_users_email",
        columnNames: ["email"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint("users", "UQ_users_email");
  }
}
