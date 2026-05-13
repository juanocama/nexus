import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Vehicle } from '../../database/entities/vehicle.entity';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto, driverId: string): Promise<Vehicle> {
    const plate = createVehicleDto.plate.trim();
    const existing = await this.vehiclesRepository.findOne({
      where: { driver: { id: driverId }, plate },
      withDeleted: true,
    });
    if (existing) {
      existing.brand = createVehicleDto.brand.trim();
      existing.model = createVehicleDto.model.trim();
      existing.color = createVehicleDto.color.trim();
      existing.plate = plate;
      existing.deleted_at = null;
      return this.vehiclesRepository.save(existing);
    }
    const vehicle = this.vehiclesRepository.create({
      ...createVehicleDto,
      brand: createVehicleDto.brand.trim(),
      model: createVehicleDto.model.trim(),
      color: createVehicleDto.color.trim(),
      plate,
      driver: { id: driverId },
    });
    return this.vehiclesRepository.save(vehicle);
  }

  async findByDriver(driverId: string): Promise<Vehicle[]> {
    return this.vehiclesRepository.find({
      where: { driver: { id: driverId }, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findOne({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto, userId: string): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    if (vehicle.driver_id !== userId) {
      throw new NotFoundException('Vehicle not found');
    }
    await this.vehiclesRepository.update(id, updateVehicleDto);
    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const vehicle = await this.findOne(id);
    if (vehicle.driver_id !== userId) {
      throw new NotFoundException('Vehicle not found');
    }
    await this.vehiclesRepository.update(id, { deleted_at: new Date() });
  }
}
