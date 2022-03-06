// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class ResolutionVoter extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("votingPower", Value.fromBigInt(BigInt.zero()));
    this.set("address", Value.fromBytes(Bytes.empty()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save ResolutionVoter entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save ResolutionVoter entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("ResolutionVoter", id.toString(), this);
    }
  }

  static load(id: string): ResolutionVoter | null {
    return changetype<ResolutionVoter | null>(store.get("ResolutionVoter", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get votingPower(): BigInt {
    let value = this.get("votingPower");
    return value!.toBigInt();
  }

  set votingPower(value: BigInt) {
    this.set("votingPower", Value.fromBigInt(value));
  }

  get address(): Bytes {
    let value = this.get("address");
    return value!.toBytes();
  }

  set address(value: Bytes) {
    this.set("address", Value.fromBytes(value));
  }
}

export class ResolutionType extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("name", Value.fromString(""));
    this.set("quorum", Value.fromBigInt(BigInt.zero()));
    this.set("noticePeriod", Value.fromBigInt(BigInt.zero()));
    this.set("votingPeriod", Value.fromBigInt(BigInt.zero()));
    this.set("canBeNegative", Value.fromBoolean(false));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save ResolutionType entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save ResolutionType entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("ResolutionType", id.toString(), this);
    }
  }

  static load(id: string): ResolutionType | null {
    return changetype<ResolutionType | null>(store.get("ResolutionType", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get name(): string {
    let value = this.get("name");
    return value!.toString();
  }

  set name(value: string) {
    this.set("name", Value.fromString(value));
  }

  get quorum(): BigInt {
    let value = this.get("quorum");
    return value!.toBigInt();
  }

  set quorum(value: BigInt) {
    this.set("quorum", Value.fromBigInt(value));
  }

  get noticePeriod(): BigInt {
    let value = this.get("noticePeriod");
    return value!.toBigInt();
  }

  set noticePeriod(value: BigInt) {
    this.set("noticePeriod", Value.fromBigInt(value));
  }

  get votingPeriod(): BigInt {
    let value = this.get("votingPeriod");
    return value!.toBigInt();
  }

  set votingPeriod(value: BigInt) {
    this.set("votingPeriod", Value.fromBigInt(value));
  }

  get canBeNegative(): boolean {
    let value = this.get("canBeNegative");
    return value!.toBoolean();
  }

  set canBeNegative(value: boolean) {
    this.set("canBeNegative", Value.fromBoolean(value));
  }
}

export class Resolution extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("ipfsDataURI", Value.fromString(""));
    this.set("isNegative", Value.fromBoolean(false));
    this.set("yesVotesTotal", Value.fromBigInt(BigInt.zero()));
    this.set("resolutionType", Value.fromString(""));
    this.set("approveTimestamp", Value.fromBigInt(BigInt.zero()));
    this.set("createTimestamp", Value.fromBigInt(BigInt.zero()));
    this.set("updateTimestamp", Value.fromBigInt(BigInt.zero()));
    this.set("createBy", Value.fromBytes(Bytes.empty()));
    this.set("voters", Value.fromStringArray(new Array(0)));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Resolution entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save Resolution entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("Resolution", id.toString(), this);
    }
  }

  static load(id: string): Resolution | null {
    return changetype<Resolution | null>(store.get("Resolution", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get ipfsDataURI(): string {
    let value = this.get("ipfsDataURI");
    return value!.toString();
  }

  set ipfsDataURI(value: string) {
    this.set("ipfsDataURI", Value.fromString(value));
  }

  get title(): string | null {
    let value = this.get("title");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set title(value: string | null) {
    if (!value) {
      this.unset("title");
    } else {
      this.set("title", Value.fromString(<string>value));
    }
  }

  get content(): string | null {
    let value = this.get("content");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set content(value: string | null) {
    if (!value) {
      this.unset("content");
    } else {
      this.set("content", Value.fromString(<string>value));
    }
  }

  get isNegative(): boolean {
    let value = this.get("isNegative");
    return value!.toBoolean();
  }

  set isNegative(value: boolean) {
    this.set("isNegative", Value.fromBoolean(value));
  }

  get yesVotesTotal(): BigInt {
    let value = this.get("yesVotesTotal");
    return value!.toBigInt();
  }

  set yesVotesTotal(value: BigInt) {
    this.set("yesVotesTotal", Value.fromBigInt(value));
  }

  get resolutionType(): string {
    let value = this.get("resolutionType");
    return value!.toString();
  }

  set resolutionType(value: string) {
    this.set("resolutionType", Value.fromString(value));
  }

  get approveTimestamp(): BigInt {
    let value = this.get("approveTimestamp");
    return value!.toBigInt();
  }

  set approveTimestamp(value: BigInt) {
    this.set("approveTimestamp", Value.fromBigInt(value));
  }

  get createTimestamp(): BigInt {
    let value = this.get("createTimestamp");
    return value!.toBigInt();
  }

  set createTimestamp(value: BigInt) {
    this.set("createTimestamp", Value.fromBigInt(value));
  }

  get updateTimestamp(): BigInt {
    let value = this.get("updateTimestamp");
    return value!.toBigInt();
  }

  set updateTimestamp(value: BigInt) {
    this.set("updateTimestamp", Value.fromBigInt(value));
  }

  get createBy(): Bytes {
    let value = this.get("createBy");
    return value!.toBytes();
  }

  set createBy(value: Bytes) {
    this.set("createBy", Value.fromBytes(value));
  }

  get voters(): Array<string> {
    let value = this.get("voters");
    return value!.toStringArray();
  }

  set voters(value: Array<string>) {
    this.set("voters", Value.fromStringArray(value));
  }
}

export class ResolutionManager extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("contributorsAddresses", Value.fromBytesArray(new Array(0)));
    this.set("foundersAddresses", Value.fromBytesArray(new Array(0)));
    this.set("shareholdersAddresses", Value.fromBytesArray(new Array(0)));
    this.set("investorsAddresses", Value.fromBytesArray(new Array(0)));
    this.set("resolutionTypes", Value.fromStringArray(new Array(0)));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save ResolutionManager entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save ResolutionManager entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("ResolutionManager", id.toString(), this);
    }
  }

  static load(id: string): ResolutionManager | null {
    return changetype<ResolutionManager | null>(
      store.get("ResolutionManager", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get contributorsAddresses(): Array<Bytes> {
    let value = this.get("contributorsAddresses");
    return value!.toBytesArray();
  }

  set contributorsAddresses(value: Array<Bytes>) {
    this.set("contributorsAddresses", Value.fromBytesArray(value));
  }

  get foundersAddresses(): Array<Bytes> {
    let value = this.get("foundersAddresses");
    return value!.toBytesArray();
  }

  set foundersAddresses(value: Array<Bytes>) {
    this.set("foundersAddresses", Value.fromBytesArray(value));
  }

  get shareholdersAddresses(): Array<Bytes> {
    let value = this.get("shareholdersAddresses");
    return value!.toBytesArray();
  }

  set shareholdersAddresses(value: Array<Bytes>) {
    this.set("shareholdersAddresses", Value.fromBytesArray(value));
  }

  get investorsAddresses(): Array<Bytes> {
    let value = this.get("investorsAddresses");
    return value!.toBytesArray();
  }

  set investorsAddresses(value: Array<Bytes>) {
    this.set("investorsAddresses", Value.fromBytesArray(value));
  }

  get resolutionTypes(): Array<string> {
    let value = this.get("resolutionTypes");
    return value!.toStringArray();
  }

  set resolutionTypes(value: Array<string>) {
    this.set("resolutionTypes", Value.fromStringArray(value));
  }
}
